import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { UploadWorkflowComponent } from './upload-workflow.component';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { GraphqlService } from '../../../app/shared/graphql/services/graphql.service';
import { LlmService } from '../../llm-chat/llm.service';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../../../app/shared/components/search-bar/search-bar.component';

describe('UploadWorkflowComponent', () => {
    let component: UploadWorkflowComponent;
    let fixture: ComponentFixture<UploadWorkflowComponent>;
    let graphqlServiceSpy: jasmine.SpyObj<GraphqlService>;
    let llmServiceSpy: jasmine.SpyObj<LlmService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        graphqlServiceSpy = jasmine.createSpyObj('GraphqlService', ['getBasicBots']);
        llmServiceSpy = jasmine.createSpyObj('LlmService', ['recommendWorkflow']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [
                UploadWorkflowComponent,
                ReactiveFormsModule,
                FormsModule,
                HttpClientTestingModule,
                CommonModule,
            ],
            providers: [
                FormBuilder,
                { provide: GraphqlService, useValue: graphqlServiceSpy },
                { provide: LlmService, useValue: llmServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(UploadWorkflowComponent);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should call loadBots', () => {
            spyOn(component, 'loadBots');
            component.ngOnInit();
            expect(component.loadBots).toHaveBeenCalled();
        });
    });

    describe('loadBots', () => {
        it('should load bots and set allBots and filteredBots', () => {
            const botsData = {
                data: {
                    bots: [
                        {
                            id: '1',
                            name: 'Bot1',
                            sourcePlatform: 'platform1',
                            images: [{ type: 'logo', url: 'img1.png' }]
                        },
                        {
                            id: '2',
                            name: 'Bot2',
                            sourcePlatform: 'platform2',
                            images: []
                        }
                    ]
                }
            };
            graphqlServiceSpy.getBasicBots.and.returnValue(of(botsData));
            component.loadBots();
            expect(component.allBots.length).toBe(2);
            expect(component.filteredBots.length).toBe(2);
            expect(component.allBots[0].image).toBe('img1.png');
            expect(component.allBots[1].image).toBeUndefined();
        });

        it('should handle error', () => {
            spyOn(console, 'error');
            graphqlServiceSpy.getBasicBots.and.returnValue(throwError(() => new Error('fail')));
            component.loadBots();
            expect(console.error).toHaveBeenCalledWith('Error loading bots:', jasmine.any(Error));
        });
    });

    describe('onSearchChange', () => {
        beforeEach(() => {
            component.allBots = [
                { id: '1', name: 'Alpha', platform: 'p1' },
                { id: '2', name: 'Beta', platform: 'p2' }
            ];
            component.selectedBots = [{ id: '2', name: 'Beta', platform: 'p2' }];
        });

        it('should filter bots by query and exclude selected', () => {
            component.onSearchChange('alp');
            expect(component.filteredBots).toEqual([{ id: '1', name: 'Alpha', platform: 'p1' }]);
        });

        it('should return all unselected bots if query is empty', () => {
            component.onSearchChange('');
            expect(component.filteredBots).toEqual([{ id: '1', name: 'Alpha', platform: 'p1' }]);
        });
    });

    describe('selectBot', () => {
        beforeEach(() => {
            component.selectedBots = [];
            component.allBots = [
                { id: '1', name: 'Alpha', platform: 'p1' },
                { id: '2', name: 'Beta', platform: 'p2' }
            ];
            component.filteredBots = [...component.allBots];
        });

        it('should add bot to selectedBots and update form', () => {
            spyOn(component, 'onSearchChange');
            component.selectBot(component.allBots[0]);
            expect(component.selectedBots).toContain(component.allBots[0]);
            expect(component.workflowForm.value.botIds).toEqual(['1']);
            expect(component.onSearchChange).toHaveBeenCalledWith('');
        });
    });

    describe('removeBot', () => {
        beforeEach(() => {
            component.selectedBots = [
                { id: '1', name: 'Alpha', platform: 'p1' },
                { id: '2', name: 'Beta', platform: 'p2' }
            ];
        });

        it('should remove bot from selectedBots and update form', () => {
            spyOn(component, 'onSearchChange');
            component.removeBot('1');
            expect(component.selectedBots.length).toBe(1);
            expect(component.selectedBots[0].id).toBe('2');
            expect(component.workflowForm.value.botIds).toEqual(['2']);
            expect(component.onSearchChange).toHaveBeenCalledWith('');
        });
    });

    describe('generateWithLlm', () => {
        it('should not call service if goalInput is empty', () => {
            component.goalInput = '   ';
            component.recommending = false;
            component.generateWithLlm();
            expect(component.recommending).toBe(false);
            expect(llmServiceSpy.recommendWorkflow).not.toHaveBeenCalled();
        });

        it('should call llmService and patch form on success', fakeAsync(() => {
            component.goalInput = 'Test goal';
            const wf = {
                name: 'WF',
                description: 'desc',
                tags: ['a', 'b'],
                configJson: { foo: 'bar' },
                bots: [{ id: '1', name: 'Bot', platform: 'p' }]
            };
            llmServiceSpy.recommendWorkflow.and.returnValue(of({ workflow: wf }));
            component.generateWithLlm();
            tick();
            expect(component.workflowForm.value.name).toBe('WF');
            expect(component.workflowForm.value.description).toBe('desc');
            expect(component.workflowForm.value.useCase).toBe('Test goal');
            expect(component.workflowForm.value.tags).toBe('a, b');
            expect(component.workflowForm.value.botIds).toEqual(['1']);
            expect(component.selectedBots).toEqual(wf.bots);
            expect(component.recommending).toBe(false);
        }));

        it('should handle error from llmService', fakeAsync(() => {
            component.goalInput = 'Test goal';
            spyOn(console, 'error');
            llmServiceSpy.recommendWorkflow.and.returnValue(throwError(() => new Error('fail')));
            component.generateWithLlm();
            tick();
            expect(console.error).toHaveBeenCalledWith('Error generando workflow:');
            expect(component.recommending).toBe(false);
        }));
    });

});